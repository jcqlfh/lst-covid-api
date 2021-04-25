export function getDaysArray(start: Date, end: number): string[] {
  const arr = [];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + end);
  for (
    let dt = start;
    end > 0 ? dt <= endDate : dt >= endDate;
    end > 0 ? dt.setDate(dt.getDate() + 1) : dt.setDate(dt.getDate() - 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr.map(date => getStrDate(date));
}

export function getStrDate(date: Date): string {
  return (
    ('' + date.getDate()).padStart(2, '0') +
    '/' +
    ('' + (date.getMonth() + 1)).padStart(2, '0') +
    '/' +
    date.getFullYear()
  );
}
