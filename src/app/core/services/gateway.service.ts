import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../state/session.store';
import { BandEngineService } from './band-engine.service';

type AnalysisEvent = {
  type: 'analysis.event';
  key?: string;
  tempo?: number;
  chord?: string;
  bar?: number;
  conf?: number;
};

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private ws?: WebSocket;
  private url = environment.WS_URL;
  private retryMs = 1000;
  private maxRetryMs = 8000;
  private manualClose = false;

  constructor(
    private session: SessionStore,
    private band: BandEngineService,
    private zone: NgZone
  ) {}

  connect() {
    this.manualClose = false;
    this.open();
  }

  disconnect() {
    this.manualClose = true;
    try { this.ws?.close(); } catch {}
    this.ws = undefined;
  }

  private open() {
    if (this.ws) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.retryMs = 1000;
      // no-op handshake
    };

    this.ws.onmessage = (evt) => {
      // Ensure UI updates happen inside Angular zone
      this.zone.run(() => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg?.type === 'analysis.event') {
            this.handleAnalysis(msg as AnalysisEvent);
          }
        } catch {}
      });
    };

    this.ws.onerror = () => {
      // allow onclose to handle retry
    };

    this.ws.onclose = () => {
      this.ws = undefined;
      if (!this.manualClose) {
        setTimeout(() => this.open(), this.retryMs);
        this.retryMs = Math.min(this.retryMs * 2, this.maxRetryMs);
      }
    };
  }

  private handleAnalysis(e: AnalysisEvent) {
    if (typeof e.tempo === 'number') {
      this.session.setTempo(e.tempo);
      this.band.setTempo(e.tempo);
    }
    if (typeof e.key === 'string') {
      this.session.setKey(e.key);
    }
    if (typeof e.chord === 'string') {
      this.session.setChord(e.chord);
      this.band.setChord(e.chord);
    }
    // Optionally adjust mode once first event arrives
      if (this.session.mode() === 'LISTENING') {
        if (e.conf && e.conf > 0.8) {
          this.session.setMode('FULL');
        } else {
          this.session.setMode('REHEARSAL');
        }
      }
    }
  }
