export interface HackathonPrize {
  position: string;
  amount: string;
  color: string;
}

export interface HackathonTask {
  description: string;
  subTasks?: string[];
}

export interface HackathonRule {
  rule: string;
  isHighlighted?: boolean;
}

export interface HackathonDate {
  event: string;
  date: string;
  isHighlighted?: boolean;
  link?: string;
}

export interface HackathonSponsor {
  name: string;
  title: string;
  link?: string;
}

export interface Winner {
  position: string;
  names: string[];
  institute: string;
  image: string;
}

export interface HackathonDetails {
  id: string;
  title: string;
  subtitle: string;
  prizePool: string;
  prizes: HackathonPrize[];
  tasks: HackathonTask[];
  rules: HackathonRule[];
  dates: HackathonDate[];
  sponsors: HackathonSponsor[];
  contactEmail: string;
  isCompleted?: boolean;
  winners?: Winner[];
} 