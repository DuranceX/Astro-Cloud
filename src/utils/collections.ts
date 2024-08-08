import { getCollection } from "astro:content";

export async function getPosts(sort:string = 'desc') {
  let posts = await getCollection('posts');
  if(sort !== undefined) {
    if(sort === 'asc'){
      posts = posts.sort((a:any, b:any) => {
        return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
      })
    }else{
      posts = posts.sort((a:any, b:any) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
      })
    }
  }
  return posts;
}
