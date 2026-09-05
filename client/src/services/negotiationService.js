import api from './api';

export const negotiationService = {
  getNegotiationByQuote: async (quoteId = 'latest') => {
    const res = await api.get(`/negotiations/${quoteId}`);
    return res.data;
  },

  submitCounterOffer: async (quoteId, counterData) => {
    const res = await api.post(`/negotiations/${quoteId}/counter`, counterData);
    return res.data;
  },

  addComment: async (negotiationId, commentData) => {
    const res = await api.post(`/negotiations/${negotiationId}/comments`, commentData);
    return res.data;
  }
};

export default negotiationService;
