'use client';
import { useState, useEffect, useRef } from 'react';
import { GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

let galleryFetchPromise = null;

export const useGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (!GOOGLE_SCRIPT_URL) {
          setLoading(false);
          return;
        }

        const CACHE_KEY = 'gallery_data_v3';
        const CACHE_TIMESTAMP_KEY = 'gallery_timestamp_v3';
        const CACHE_TTL = 30 * 60 * 1000;

        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cached && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp, 10);
          if (age < CACHE_TTL) {
            setImages(JSON.parse(cached));
            setLoading(false);
            return;
          }
          setImages(JSON.parse(cached));
          setLoading(false);
        }

        if (!galleryFetchPromise) {
          galleryFetchPromise = (async () => {
            try {
              const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getImages`, {
                signal: AbortSignal.timeout(15000),
              });
              const data = await response.json();
              if (data.status === 'success') return data.data;
              throw new Error(data.message || 'Failed to fetch images');
            } finally {
              galleryFetchPromise = null;
            }
          })();
        }

        const data = await galleryFetchPromise;
        setImages(data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (err) {
        if (!images.length) {
          setError('Error connecting to gallery service');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchImages();
    }
  }, []);

  const getImageByName = (name) => {
    if (!name) return undefined;
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = images.find(img =>
      img.name && img.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedName)
    );
    return found?.url;
  };

  return { images, loading, error, getImageByName };
};
