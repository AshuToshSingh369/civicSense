import axios from 'axios'; // Ensure axial or native fetch is used. I'll use native fetch for less deps.

// You can configure this base URL depending on your Vite env vars
const API_BASE_URL = '/api';

export const issueService = {
    /**
     * Fetch issues within a specific map bounding box (BBox) to prevent loading 10,000 markers at once
     * @param swLat SouthWest Latitude
     * @param swLng SouthWest Longitude
     * @param neLat NorthEast Latitude
     * @param neLng NorthEast Longitude
     * @param status Optional filter by status ('pending', 'in-progress', 'resolved')
     */
    getIssuesInBounds: async (
        swLat: number,
        swLng: number,
        neLat: number,
        neLng: number,
        status?: string
    ) => {
        try {
            // Build query string
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

    /**
     * Get a single issue's details for a popup
     */
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
