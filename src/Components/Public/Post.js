/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { Grid } from "@mui/material";
import PostBody from "./PostBody";
import { useRef } from "react";

export default function Post({ type }) {
  const [articles, setArticles] = useState([]);
  const [numArticles, setNumArticles] = useState(5);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    setLoading(true);
    const articleRef = collection(db, "Articles");
    const q = query(
      articleRef,
      orderBy("createdAt", "desc"),
      limit(numArticles)
    );
    if (!type) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const articles = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))          
        setArticles(articles);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const articles = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((article) => article.type === `${type}`);
        setArticles(articles);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [numArticles]);

  const handleScroll = () => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      setNumArticles(numArticles + 5);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Grid container spacing={2}>
        {articles.length === 0 ? (
          <Grid item xs={12}>
            <p>No articles found!</p>
          </Grid>
        ) : (
          articles.map(
            ({
              id,
              title,
              description,
              imageUrls,
              photoURL,
              createdAt,
              type,
              createdBy,
              comments,
            }) => (
              <PostBody
                key={id}
                title={title}
                description={description}
                imageUrls={imageUrls}
                photoURL={photoURL}
                createdAt={createdAt}
                type={type}
                createdBy={createdBy}
                comments={comments}
              ></PostBody>
            )
          )
        )}
        <div ref={bottomRef} />
      </Grid>
    </>
  );
}
