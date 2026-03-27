import express from 'express';

const router = express.Router();

// In-memory storage for social media (model doesn't exist)
interface SocialMediaPost {
  id: number;
  clubId: number;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

const postsStore: Map<number, SocialMediaPost> = new Map();
let nextPostId = 1;

// Get posts for a club
router.get('/:clubId/posts', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const posts = Array.from(postsStore.values())
      .filter(p => p.clubId === clubId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a post
router.post('/:clubId/posts', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const post: SocialMediaPost = {
      id: nextPostId++,
      clubId,
      content,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };
    postsStore.set(post.id, post);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like a post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const post = postsStore.get(postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    post.likes++;
    postsStore.set(postId, post);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Delete a post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    postsStore.delete(postId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;