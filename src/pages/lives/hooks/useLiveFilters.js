// src/components/Live/hooks/useLiveFilters.js

import { useReducer, useState, useMemo } from 'react';
import { statusLabels, filters } from '../components/constants';

export const useLiveFilters = (lives) => {
    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { valueStatus: "Todos", searchTerm: "" }
    );

    const [filterItems, setFilterItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (id) => (e) => {
        const { name, value } = e.target;
        setFilterItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item
            )
        );
    };

    const handleReset = () => {
        setFilterItems([]);
        setShowFilters(false);
        dispatch({ valueStatus: "Todos", searchTerm: "" });
    };

    const addFilter = () => {
        const newItem = {
            id: Date.now(),
            fields: {
                selectedField: filters[0].title,
                filterValue: '',
            },
        };
        setFilterItems([...filterItems, newItem]);
        setShowFilters(true);
    };

    const deleteFilter = (id) => setFilterItems(filterItems.filter((item) => item.id !== id));

    const displayRows = useMemo(() => {
        let filtered = (lives || []).filter(l => !!l?.title);

        if (state.searchTerm) {
            const search = state.searchTerm.toLowerCase();
            filtered = filtered.filter((row) => {
                const title = row.title?.toLowerCase() || '';
                const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                return title.includes(search) || status.includes(search);
            });
        }

        if (state.valueStatus.toLowerCase() !== "todos") {
            filtered = filtered.filter((l) =>
                l.status?.toLowerCase() === state.valueStatus.toLowerCase()
            );
        }

        if (filterItems.length > 0) {
            filtered = filtered.filter((row) =>
                filterItems.every((filter) => {
                    const field = filter.fields.selectedField;
                    const value = filter.fields.filterValue.toLowerCase();
                    if (field === 'title') {
                        return row.title?.toLowerCase().includes(value);
                    } else if (field === 'status') {
                        const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                        return status.includes(value);
                    }
                    return false;
                })
            );
        }

        return filtered;
    }, [lives, state.searchTerm, state.valueStatus, filterItems]);

    return {
        state,
        dispatch,
        filterItems,
        showFilters,
        setShowFilters,
        displayRows,
        handleChange,
        handleReset,
        addFilter,
        deleteFilter,
    };
};