export class Task {
  constructor(public data: TaskType) {}
}

// type ZeroToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
// type YearString = `${1 | 2}${ZeroToNine}${ZeroToNine}${ZeroToNine}`;
// type MonthString = `${1 | 2 | 3}${ZeroToNine}`;

// function check

// const yyyy: Year = Number(1222);
// "2021-10-15"

export interface TaskType {
  id: string;
  subject: string;
  description?: string;
  creationAuthor: number;
  executor?: number;
  creationDate: Date;
  planStartDate: string;
  planEndDate: string;
  endDate: string;
  status: number;
  order: number;
}
