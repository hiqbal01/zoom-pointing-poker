export interface Ticket {
  id: string;
  title: string;
  description: string;
}

export interface Vote {
  userId: string;
  points: number;
}

export interface Participant {
  userId: string;
  displayName: string;
  avatar?: string;
}

export interface ZoomParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isHost: boolean;
  isCoHost: boolean;
}

export interface ZoomEvent {
  participants: ZoomParticipant[];
}

export interface ZoomUserContext {
  participantId: string;
  screenName: string;
  role: 'host' | 'co-host' | 'participant';
}

export type PointValue = 1 | 2 | 3 | 5 | 8 | 13; 