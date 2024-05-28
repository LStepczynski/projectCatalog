import React from "react";

interface Props {
  article: Article
}

interface Article {
  Title: string;
  Description: string;
  Author: String;
  PrimaryCategory: string;
  SecondaryCategories: string[];
  Rating: number;
  UpdatedAt: number;
  CreatedAt: number;
  PublishedAt: number;
  Difficulty: string;
  ID: string;
}

export const ArticleCompressed = (props: Props) => {
  const { article } = props;
}