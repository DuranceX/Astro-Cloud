export function formateDate(date: Date): {year: number, month: string, day: string} {
    const month = (date.getMonth() + 1)<10 ? '0'+(date.getMonth() + 1) : (date.getMonth() + 1);
    const day = date.getDate()<10 ? '0'+date.getDate() : date.getDate();
    return {
        year: date.getFullYear(),
        month: month.toString(),
        day: day.toString()
    }
}