import { booleanAttribute, Component, input, OnInit } from '@angular/core';
import { Song } from '../interfaces/song';

@Component({
  selector: 'app-song-info',
  standalone: false,
  templateUrl: './song-info.html',
  styleUrl: './song-info.css',
  host:{
    '[class]': 'displayMode()',
  }
})
export class SongInfo{
  display_mode = input.required<string>({ alias: 'displayMode'});
  // `song` input may be provided as a signal accessor (song()) or as a plain object.
  // Accept either and expose a safe getter for the template.
  song = input.required<Song>();

  private readSong(): Song | undefined {
    try {
      // If `song` is a signal/accessor function, call it
      if (typeof (this.song as any) === 'function') {
        return (this.song as any)();
      }
    } catch (e) {
      // If calling fails, fall through to returning raw value below
    }
    // Otherwise assume it's a plain object
    return this.song as unknown as Song | undefined;
  }

  displayMode(){
    try {
      return typeof (this.display_mode as any) === 'function' ? (this.display_mode as any)() : (this.display_mode as unknown as string);
    } catch {
      return this.display_mode as unknown as string;
    }
  }

  // Template helper used to access the song safely
  songValue(): Song | undefined {
    return this.readSong();
  }
}
