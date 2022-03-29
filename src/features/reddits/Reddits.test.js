import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../../app/store';
import Reddits from './Reddits';
import { loadReddits } from "./redditsSlice";
import redditApi from '../../api/reddit-api';

jest.mock('../../api/reddit-api');

describe("<Reddits />", () => {
    it("Renders <Reddits /> component correctly", () => {
        render(<Provider store={store}><Reddits /></Provider>);
        expect(
          screen.getByText(/popular/i)
        ).toBeInTheDocument();
    });

    describe("reddit API tests", () => {
        it("fetches popular posts from Reddit API", async () => {
            const topic = "popular";
            const expectedValue = [
                {
                    id: "id",
                    subreddit: "subreddit",
                    title: "title",
                    mediaType: "Media Type",
                    media: "url",
                    author: "author",
                    upvotes: "100",
                    postedOn: "2022",
                    numberOfComments: "200"
                }
            ];
            const mockResponse = {
                data: {
                    children: [
                        {
                            data: {
                                id: "id",
                                subreddit_name_prefixed: "subreddit",
                                title: "title",
                                post_hint: "Media Type",
                                url_overridden_by_dest: "url",
                                author: "author",
                                ups: "100",
                                created_utc: "2022",
                                num_comments: "200"
                            }
                        }
                    ]
                }
            }
            redditApi.mockResolvedValue(mockResponse);
            const loadRedditsResult = await store.dispatch(loadReddits(topic));
            const actualValue = loadRedditsResult.payload;
            expect(actualValue).toEqual(expectedValue);
        });
    });

  });