import chai from 'chai';

import { generatePaginatedResponse } from '../index.js';

chai.should();

describe('generatePaginatedResponse()', () => {
  it('should work', async () => {
    generatePaginatedResponse([{ id: '123', createdAt: new Date(1733835524000) }], {
      isForwardPagination: true,
      requestedCount: 10,
    })
      .should.deep.equal({
        pageInfo: {
          endCursor: 'MTczMzgzNTUyNDAwMDo6MTIz',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'MTczMzgzNTUyNDAwMDo6MTIz',
        },
        edges: [
          {
            cursor: 'MTczMzgzNTUyNDAwMDo6MTIz',
            node: { id: '123', createdAt: new Date(1733835524000) },
          },
        ],
      });
  });
});
