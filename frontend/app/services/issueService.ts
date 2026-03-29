import axios from 'axios'; 


const API_BASE_URL = '/api';

export const issueService = {
    
    getIssuesInBounds: async (
        swLat: number,
        swLng: number,
        neLat: number,
        neLng: number,
        status?: string
    ) => {
        try {
            
            const queryParams = new URLSearchParams({
                swLat: swLat.toString(),
                swLng: swLng.toString(),
                neLat: neLat.toString(),
                neLng: neLng.toString(),
                ...(status && { status })
            });

            const response = await fetch(`${API_BASE_URL}/issues/map?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch map issues');

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching issues for map bounds:", error);
            throw error;
        }
    },

    
    getIssueDetails: async (issueId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/issues/${issueId}`);
            if (!response.ok) throw new Error('Failed to fetch issue details');
            return await response.json();
        } catch (error) {
            console.error("Error fetching issue details:", error);
            throw error;
        }
    }
};
