enum tagColor {
    'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-night dark:text-red-50 dark:hover:bg-red-900',
    'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-night dark:text-emerald-50 dark:hover:bg-emerald-900',
    'bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-night dark:text-blue-50 dark:hover:bg-blue-900',
    'bg-purple-50 text-purple-500 hover:bg-purple-100 dark:bg-purple-night dark:text-purple-50 dark:hover:bg-purple-900',
    'bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-night dark:text-amber-50 dark:hover:bg-amber-900',
    'bg-pink-50 text-pink-500 hover:bg-pink-100 dark:bg-pink-night dark:text-pink-50 dark:hover:bg-pink-900',
    'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 dark:bg-indigo-night dark:text-indigo-50 dark:hover:bg-indigo-900',
    'bg-fuchsia-50 text-fuchsia-500 hover:bg-fuchsia-100 dark:bg-fuchsia-night dark:text-fuchsia-50 dark:hover:bg-fuchsia-900',
}

let tags:{[key:string]:string} = {
    
}

export function getTagColor(){
    return tagColor;
}

export function getTags(){
    return tags;
}

export function setTags(newTags:any){
    tags = newTags;
}