import { getCollection } from "astro:content";

export async function getPosts(sort:string = 'desc') {
  let posts = await getCollection('posts');
  let pinned = posts.filter((post:any) => post.data.pinned);
  posts = posts.filter((post:any) => !post.data.pinned);
  if(sort !== undefined) {
    if(sort === 'asc'){
      pinned = pinned.sort((a:any, b:any) => {
        return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
      })
      posts = posts.sort((a:any, b:any) => {
        return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
      })
    }else{
      pinned = pinned.sort((a:any, b:any) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
      })
      posts = posts.sort((a:any, b:any) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
      })
    }
  }
  return pinned.concat(posts);
}

export async function getAbout() {
  return await getCollection('about');
}
