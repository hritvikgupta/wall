import React from 'react';
import { BlogPost } from '../types';

interface FeaturedPostProps {
  post: BlogPost;
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
  return (
    <div className="mt-12 md:mt-24 group cursor-pointer">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Content Side */}
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center gap-3 font-mono text-xs text-muted mb-6 uppercase tracking-wider">
            <span>{post.date}</span>
            <span className="text-gray-700">/</span>
            <span>{post.author}</span>
            <span className="text-gray-700">/</span>
            <span className="text-white font-bold">{post.category}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-mono font-bold text-white mb-6 leading-tight group-hover:underline decoration-1 underline-offset-8 decoration-gray-600 transition-all">
            {post.title}
          </h2>

          <p className="font-mono text-muted text-base leading-relaxed line-clamp-3 mb-6">
            {post.excerpt}
          </p>
          
          <div className="text-xs font-mono text-white border-b border-transparent group-hover:border-white w-max transition-all pb-1">
            Read Article
          </div>
        </div>

        {/* Image Side */}
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden bg-surface">
           <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105 transform duration-700 ease-out"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 md:hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;