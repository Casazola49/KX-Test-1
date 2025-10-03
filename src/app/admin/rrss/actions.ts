'use server';

import { 
  getAllSocialMediaPosts, 
  getSocialMediaPost, 
  createSocialMediaPost, 
  updateSocialMediaPost, 
  deleteSocialMediaPost 
} from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

export async function getSocialMediaPostsAction() {
  try {
    return await getAllSocialMediaPosts();
  } catch (error) {
    console.error('Error in getSocialMediaPostsAction:', error);
    throw error;
  }
}

export async function getSocialMediaPostAction(id: string) {
  try {
    return await getSocialMediaPost(id);
  } catch (error) {
    console.error('Error in getSocialMediaPostAction:', error);
    throw error;
  }
}

export async function createSocialMediaPostAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail_url = formData.get('thumbnail_url') as string;
    
    const postData: any = {
      platform: formData.get('platform') as 'youtube' | 'instagram' | 'tiktok' | 'facebook',
      post_url: formData.get('post_url') as string,
      is_active: formData.get('is_active') === 'true'
    };

    // Solo añadir campos opcionales si tienen valor
    if (title && title.trim()) {
      postData.title = title.trim();
    }
    if (description && description.trim()) {
      postData.description = description.trim();
    }
    if (thumbnail_url && thumbnail_url.trim()) {
      postData.thumbnail_url = thumbnail_url.trim();
    }

    const id = await createSocialMediaPost(postData);
    
    // Revalidar las páginas que muestran contenido de redes sociales
    revalidatePath('/admin/rrss');
    revalidatePath('/galeria');
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in createSocialMediaPostAction:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSocialMediaPostAction(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail_url = formData.get('thumbnail_url') as string;
    
    const postData: any = {
      platform: formData.get('platform') as 'youtube' | 'instagram' | 'tiktok' | 'facebook',
      post_url: formData.get('post_url') as string,
      is_active: formData.get('is_active') === 'true'
    };

    // Solo añadir campos opcionales si tienen valor
    if (title && title.trim()) {
      postData.title = title.trim();
    }
    if (description && description.trim()) {
      postData.description = description.trim();
    }
    if (thumbnail_url && thumbnail_url.trim()) {
      postData.thumbnail_url = thumbnail_url.trim();
    }

    await updateSocialMediaPost(id, postData);
    
    // Revalidar las páginas que muestran contenido de redes sociales
    revalidatePath('/admin/rrss');
    revalidatePath('/galeria');
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateSocialMediaPostAction:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSocialMediaPostAction(id: string) {
  try {
    await deleteSocialMediaPost(id);
    
    // Revalidar las páginas que muestran contenido de redes sociales
    revalidatePath('/admin/rrss');
    revalidatePath('/galeria');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteSocialMediaPostAction:', error);
    return { success: false, error: error.message };
  }
}