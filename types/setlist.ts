export type Song = {
  id: string;
  title: string;
  duration: string;
  soundCue: string;
  lightingCue: string;
  memo: string;
};

export type SetlistData = {
  eventName: string;
  artistName: string;
  eventDate: string;
  venue: string;
  stageTime: string;
  contactName: string;
  songs: Song[];
  overallSoundRequest: string;
  overallLightingRequest: string;
  notes: string;
};
