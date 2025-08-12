import { Injectable } from '@angular/core';
import * as Tone from 'tone';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class RecordingService {
  private dest = (Tone.getContext().rawContext as AudioContext).createMediaStreamDestination();
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];

  constructor(private audio: AudioService) {
    // route band output into recording destination
    Tone.Destination.connect(this.dest);
  }

  async start() {
    this.audio.connectRecorder(this.dest);
    this.chunks = [];
    this.recorder = new MediaRecorder(this.dest.stream);
    this.recorder.ondataavailable = e => this.chunks.push(e.data);
    this.recorder.start();
  }

  async stop(): Promise<string> {
    return new Promise(resolve => {
      if (!this.recorder) {
        resolve('');
        return;
      }
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        this.audio.disconnectRecorder(this.dest);
        resolve(url);
      };
      this.recorder.stop();
    });
  }
}
