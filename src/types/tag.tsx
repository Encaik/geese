import { HomeItem } from '@/types/home';

export interface TagPageProps {
  tag_name: string;
  items: HomeItem[];
}

export interface TagPage {
  page: number;
  data: HomeItem[];
  tid: string;
  tag_name: string;
  has_more: boolean;
}

export interface TagItems {
  success: boolean;
  page: number;
  data: Tag[];
  has_more: boolean;
}

export interface Tag {
  name: string;
  tid: string;
  icon_name: string;
  repo_total: number;
  created_at: string;
  udpated_at: string;
}

export interface TagType {
  name: string;
  tid: string;
}
