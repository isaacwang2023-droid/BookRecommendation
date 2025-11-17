import React, { useMemo, useState } from 'react';
import type { Tag } from '../types';
import { addSystemTag, deleteSystemTag } from '../services/api';
import { XIcon, PlusCircleIcon, SpinnerIcon } from './icons/Icons';

interface TagManagementProps {
  allTags: Tag[];
  systemTags: Tag[];
  refreshTags: () => void;
}

const TagManagement: React.FC<TagManagementProps> = ({ allTags, systemTags, refreshTags }) => {
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userGeneratedTags = useMemo(() => {
    const systemTagNames = new Set(systemTags.map(t => t.name.toLowerCase()));
    return allTags.filter(tag => tag.type === 'user' && !systemTagNames.has(tag.name.toLowerCase()));
  }, [allTags, systemTags]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setIsSubmitting(true);
    try {
        await addSystemTag(newTag.trim());
        setNewTag('');
        refreshTags();
    } catch(error) {
        console.error("Failed to add tag", error);
        alert('添加标签失败');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDeleteTag = async (tagId: string, tagName: string) => {
      if(window.confirm(`确定要删除系统标签 "${tagName}" 吗？`)) {
          try {
              await deleteSystemTag(tagId);
              refreshTags();
          } catch(error) {
              console.error("Failed to delete tag", error);
              alert('删除标签失败');
          }
      }
  }

  const TagList: React.FC<{title: string; tags: Tag[], canDelete?: boolean}> = ({title, tags, canDelete = false}) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-xl font-bold mb-4">{title}</h4>
        {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag.id} className="flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                        {tag.name}
                        {canDelete && (
                            <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="ml-2 text-gray-500 hover:text-red-600">
                                <XIcon className="w-3 h-3"/>
                            </button>
                        )}
                    </span>
                ))}
            </div>
        ) : <p className="text-gray-500">暂无标签</p>}
    </div>
  );

  return (
    <div>
        <h3 className="text-2xl font-bold mb-4">标签管理</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h4 className="text-xl font-bold mb-4">新增系统标签</h4>
                    <form onSubmit={handleAddTag} className="flex gap-2">
                        <input 
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="新标签名称"
                            className="flex-grow p-2 border rounded"
                        />
                        <button 
                            type="submit"
                            disabled={isSubmitting || !newTag.trim()}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : <PlusCircleIcon className="w-5 h-5" />}
                            <span className="ml-2">添加</span>
                        </button>
                    </form>
                </div>
                 <TagList title="系统标签" tags={systemTags} canDelete={true} />
            </div>
            <TagList title="用户自定义标签" tags={userGeneratedTags} />
        </div>
    </div>
  );
};

export default TagManagement;
