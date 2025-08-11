import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as Tone from 'tone';

// Mock WebSocket-based analysis stream emitting chords every bar
@Injectable({ providedIn: 'root' })
export class AnalysisStreamService {
  connect(): Observable<string> {
    const seq = ['C', 'Am', 'F', 'G'];
    let i = 0;
    return new Observable<string>(sub => {
      const loop = new Tone.Loop(() => {
        sub.next(seq[i % seq.length]);
        i++;
      }, '1m').start(0);
      return () => loop.dispose();
    });
  }
}