const supertest = require('supertest');
const app = require('../server');

jest.mock('../mongodb/models.js', () => {
  return {
    getReviews: () => {
      return new Promise((resolve) => {
        resolve({ testData: true });
      });
    },
    getMetadata: () => {
      return new Promise((resolve) => {
        resolve({ testData: true });
      });
    },
    incrementHelpfulness: (reviewId) => {
      return new Promise((resolve, reject) => {
        if (reviewId !== 'fakeid') {
          resolve({ testData: true });
        } else {
          reject(new Error('Invalid review_id'));
        }
      });
    },
    updateReview: (reviewId) => {
      return new Promise((resolve, reject) => {
        if (reviewId !== 'fakeid') {
          resolve({ testData: true });
        } else {
          reject(new Error('Invalid review_id'));
        }
      });
    },
    addReview: (review) => {
      return new Promise((resolve, reject) => {
        if (review.product_id) {
          resolve({ testData: true });
        } else {
          reject(new Error('Validataion failed'));
        }
      });
    },
  };
});

describe('Express server routes', () => {
  it('GET /reviews', (done) => {
    supertest(app)
      .get('/reviews?product_id=123')
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ testData: true });
        done();
      });
  });

  it('GET /reviews/meta', (done) => {
    supertest(app)
      .get('/reviews/meta?product_id=123')
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ testData: true });
        done();
      });
  });

  it('PUT /reviews/:review_id/helpful', (done) => {
    supertest(app)
      .put('/reviews/123/helpful')
      .then((response) => {
        expect(response.status).toBe(200);
        done();
      });
  });

  it('PUT /reviews/:review_id/report', (done) => {
    supertest(app)
      .put('/reviews/123/report')
      .then((response) => {
        expect(response.status).toBe(200);
        done();
      });
  });
});
