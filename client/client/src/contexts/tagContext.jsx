import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const TagsContext = createContext();

export const TagsProvider = ({ children }) => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/tags")
            .then((response) => {
                setTags(response.data.tags);
            })
            .catch((error) => {
                console.error("Failed to fetch tags:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <TagsContext.Provider value={{ tags, loading }}>
            {children}
        </TagsContext.Provider>
    );
};

export const useTags = () => useContext(TagsContext);
