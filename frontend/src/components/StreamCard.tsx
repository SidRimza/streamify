'use client';

import { Stream } from '@/types';
import Link from 'next/link';
import { FiPlay, FiUsers } from 'react-icons/fi';

interface StreamCardProps {
  stream: Stream;
  showLink?: boolean;
}

export default function StreamCard({ stream, showLink = true }: StreamCardProps) {
  const content = (
    <div className="card group cursor-pointer hover:scale-[1.02] transition-transform duration-200 p-0 overflow-hidden">
      <div className="relative aspect-video bg-dark-300">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
            <FiPlay className="h-12 w-12 text-white/50" />
          </div>
        )}
        
        {stream.isLive && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            LIVE
          </span>
        )}
        
        <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
          <FiUsers className="h-3 w-3" />
          <span>{stream.viewerCount.toLocaleString()}</span>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary-500 rounded-full p-3">
            <FiPlay className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{stream.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stream.category}</p>
        {stream.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{stream.description}</p>
        )}
      </div>
    </div>
  );

  if (showLink) {
    return <Link href={`/watch/${stream._id}`}>{content}</Link>;
  }

  return content;
}
