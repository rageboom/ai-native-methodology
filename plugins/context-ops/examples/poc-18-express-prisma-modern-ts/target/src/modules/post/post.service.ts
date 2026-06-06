// CHAIN 5 GREEN (poc-18 dogfood) — S1 regeneration of the post service impl.
// Derived from behavior-spec/acceptance-criteria; test file unchanged (i-strict proof).
import { Prisma } from '@prisma/client';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';
import { postRepository } from './post.repository';

type CreatePostData = {
  title: string;
  content: string;
  published?: boolean;
};

// BR-POST-AUTHORSHIP-001 — authorId is taken from the authenticated user, not the request body.
const createPost = async (postBody: CreatePostData, userId: string) => {
  return postRepository.create({
    ...postBody,
    authorId: userId,
  });
};

// BR-POST-PUBLISHFILTER-001 — filter/pagination delegated to the repository.
const queryPosts = async (filter: any, options: any) => {
  return postRepository.findMany(filter, options);
};

const getPostById = async (id: string) => {
  return postRepository.findById(id);
};

// BR-POST-EXISTENCE-001 (404) before BR-POST-OWNERSHIP-001 (403).
const updatePostById = async (
  postId: string,
  updateBody: Prisma.PostUpdateInput,
  userId: string
) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  return postRepository.update(postId, updateBody);
};

// BR-POST-EXISTENCE-001 (404) before BR-POST-OWNERSHIP-002 (403).
const deletePostById = async (postId: string, userId: string) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await postRepository.delete(postId);
};

export const PostService = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
