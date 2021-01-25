import * as express from 'express';
// import Post from './post.interface';
 
class PostsController {
 
//   private posts: Post[] = [
//     {
//       author: 'Marcin',
//       content: 'Dolor sit amet',
//       title: 'Lorem Ipsum',
//     }
//   ];
 
  constructor() {
    this.getAllRulesets = this.getAllRulesets.bind(this);
  }
 
  getAllRulesets = (request: express.Request, response: express.Response) => {
    // @ts-ignore
    console.log("here ====> get")
  }
 
//   createAPost = (request: express.Request, response: express.Response) => {
//     const post: Post = request.body;
//     this.posts.push(post);
//     response.send(post);
//   }
}
 
export default new PostsController();