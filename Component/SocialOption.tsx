'use client';

import { Button } from '@/components/ui/button';
import { IPostDocument } from '@/models/post.model';
import { useUser } from '@clerk/nextjs';
import { MessageCircleCode, Repeat, Send, ThumbsUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CommentInput from './CommentInput';
import Comments from './Comments';

// import Comments 
const MotionButton = motion(Button); // Animate the like button

const SocialOption = ({ post }: { post: IPostDocument }) => {
  const { user } = useUser();
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [mounted, setMounted] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const userId = user.id;
  const isAlreadyLiked = likes.includes(userId);

  const handleLikeToggle = async () => {
    const optimisticLikes = isAlreadyLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    setLikes(optimisticLikes);

    try {
      const res = await fetch(`/api/posts/${post._id}/${isAlreadyLiked ? 'dislike' : 'like'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to update like');
    } catch (error) {
      console.error(error);
      setLikes(likes); // rollback on error
    }
  };

  return (
    <div>
      <div className='text-sm mx-2 p-2 border-b border-gray-300'>
        {likes.length > 0 && (
          <p className='text-sm text-gray-500 hover:text-blue-500 hover:underline cursor-pointer'>
            {likes.length} Like{likes.length > 1 ? 's' : ''}
          </p>
        )}
        {post.comments && post.comments.length > 0 && (
          <p onClick={()=>setCommentOpen(!commentOpen)} className='text-sm text-gray-500 hover:text-blue-500 hover:underline cursor-pointer'>
            {post.comments.length} Comment{post.comments.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className='flex items-center gap-2 mx-2 my-2'>
        <MotionButton
          whileTap={{ scale: 1.2 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleLikeToggle}
          variant='ghost'
          className={`flex items-center gap-1 transition-colors ${
            isAlreadyLiked ? 'text-blue-600' : 'text-gray-600 hover:text-black'
          }`}
        >
          <ThumbsUp
            className='w-4 h-4'
            fill={isAlreadyLiked ? '#3b82f6' : 'none'}
            stroke={isAlreadyLiked ? '#3b82f6' : 'currentColor'}
          />
          <p>{isAlreadyLiked ? 'Liked' : 'Like'}</p>
        </MotionButton>

        <Button
          onClick={() => setCommentOpen(!commentOpen)}
          variant='ghost'
          className='flex items-center gap-1 text-gray-600 hover:text-black'
        >
          <MessageCircleCode />
          <p>Message</p>
        </Button>

        <Button variant='ghost' className='flex items-center gap-1 text-gray-600 hover:text-black'>
          <Repeat />
          <p>Repost</p>
        </Button>

        <Button variant='ghost' className='flex items-center gap-1 text-gray-600 hover:text-black'>
          <Send />
          <p>Share</p>
        </Button>
      </div>

      {commentOpen && (
   
        <div className='p-4'>
               <Comments post={post}/>
               <CommentInput postId = {post._id}/>
         
        </div>
      )}
    </div>
  );
};

export default SocialOption;
