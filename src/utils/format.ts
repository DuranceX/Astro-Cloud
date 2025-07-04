export function formatDate(date: Date): {year: number, month: string, day: string} {
    const month = (date.getMonth() + 1)<10 ? '0'+(date.getMonth() + 1) : (date.getMonth() + 1);
    const day = date.getDate()<10 ? '0'+date.getDate() : date.getDate();
    return {
        year: date.getFullYear(),
        month: month.toString(),
        day: day.toString()
    }
}

export function formatNumber(num: number): string {
    if(num < 1000){
        return num.toString();
    }
    else if(num < 10000){
        return (num/1000).toFixed(1) + 'k';
    }
    else{
        return (num/1000000).toFixed(1) + 'w';
    }

}