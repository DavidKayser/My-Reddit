import React from 'react';
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectReddits, selectIsLoading, selectLoadMore, selectRedditFilter, selectNoRedditsFound, loadReddits } from "./redditsSlice";
import { useEffect, useState, useRef } from "react";
import { Loading } from "../../components/loading/Loading";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry";
import { timeConverter } from "../../utils/timeConverter";
import { NotFound } from "../../components/notFound/NotFound";
import "./Reddits.css";

const Reddits = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const isLoading = useSelector(selectIsLoading);
    const loadMore = useSelector(selectLoadMore);
    const redditFilter = useSelector(selectRedditFilter);
    const noRedditsFound = useSelector(selectNoRedditsFound);

    let reddits = useSelector(selectReddits);
    let base;
    let { search } = useParams();
    let [searchParams] = useSearchParams();
    //let search = searchParams.get("search");
    let filter = searchParams.get("filter");
    const [nextToLoad, setNextToLoad] = useState("");
    const [nextSearchToLoad, setNextSearchToLoad] = useState("");
    const [filteredReddits, setFilteredReddits] = useState(reddits);

    let tallestRefs = useRef([]);
    useEffect(() => {
        if (search) {
            if (nextSearchToLoad === "") {
                console.log("search one");
                dispatch(loadReddits({link: `/r/food/search.json?q=${search}&restrict_sr=1&sr_nsfw=`, queryType: "search"}));
            } else {
                console.log("search two")
                dispatch(loadReddits({link: `/r/food/search.json?after=${nextSearchToLoad}&q=${search}&restrict_sr=1&sr_nsfw=`, queryType: "search"}));
            }
        }

    }, [search, dispatch, nextSearchToLoad]);

    //load reddits
    useEffect(() => {
        if (nextToLoad === "none") {
            console.log("no more reddits");
            return;
        }
        if (!search) {
            console.log("load");
            dispatch(loadReddits({link: `/r/food.json?after=${nextToLoad}`, queryType: "full"}));
        }   
    }, [search, dispatch, nextToLoad]);

    //filter reddits
    useEffect(() => {
        if (filter === null) {
            setFilteredReddits(reddits);
        } else {
            setFilteredReddits(reddits.filter(reddit => reddit.flair === redditFilter));
        }
    }, [redditFilter, reddits, filter]);

    //add scroll watch to load more
    useEffect(() => {
        function watchScroll() {
            window.addEventListener("scroll", loadOnScroll);
        }
        watchScroll();
        return () => {
            window.removeEventListener("scroll", loadOnScroll);
        };
    });

    //dispatch reddits
    function loadMoreReddits() {
        if (reddits[0] && !isLoading) {
            if (search) {
                setNextSearchToLoad(loadMore);
            } else {
                setNextToLoad(loadMore);
            }
            console.log("set next to load")
        }
    }

    // load more reddits when scrolling to bottom
    function loadOnScroll() {
        let maxHeight = 0;
        for (let i = 0; i < reddits.length; i++) {
            if (tallestRefs.current && tallestRefs.current.clientHeight) {
                const { clientHeight } = tallestRefs.current[i];
                if (clientHeight > maxHeight) {
                     maxHeight = clientHeight;
                }
            } else{
                maxHeight = 600;
            }

        }
        let scrollHeight, totalHeight;
        scrollHeight = document.body.scrollHeight;
        totalHeight = window.scrollY + window.innerHeight;
        if (totalHeight <= scrollHeight - maxHeight * 2) {
            base = false
        }
        if (totalHeight >= scrollHeight - maxHeight * 2) {
            if (base === true) return;
            loadMoreReddits();
            base = true
        } 
    }

    //set path for link
    function articleRoute(singleLink, id) {
        const seperateLink = singleLink.split("/");
        const title = seperateLink[seperateLink.length -2];
        return `/article/${id}/${title}`;
    }

    //get dimensions for placeholder image
    function placeHolderDimensions(width, height) {
        const ratio = height / width * 100;
        if (ratio === 0) {
            return {
                paddingTop: 0
            }
        } else{
            return {
                paddingTop: ratio + "%"
            }
        }
    }

    return (
        <section className="main-content">
            <div id="reddits-previews">
            {noRedditsFound && (
                <NotFound />
            )}
            {reddits && !noRedditsFound &&(
                <ResponsiveMasonry
                    columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
                >
                    <Masonry>
                    {filteredReddits.map((reddit, index) => (
                        <article className="reddits-article" key={index} ref={(element) => {tallestRefs.current[index] = element}}>
                            <div className="reddit-header">
                                <p className="float-left community">{reddit.subreddit}</p>
                                <p className="float-left">Posted by {reddit.author}</p>
                            </div>
                            <Link data-testid="single-link" to={articleRoute(reddit.singleLink, reddit.id)} state={{ backgroundLocation: location }}> 
                                <div className="reddits-body">  
                                    <h3 className="reddits-title">{reddit.title}</h3>
                                    <div className="image-wrapper" style={placeHolderDimensions(reddit.mediaDimensions.width, reddit.mediaDimensions.height)}>
                                        <img className="reddits-image" src={reddit.media} alt="media" />
                                    </div>
                                </div>
                            </Link>
                            {reddit.mediaType === "link" && (
                                <a href={reddit.media} target="_blank" rel="noreferrer">LINK</a>
                            )}
                            <div className="reddit-footer">
                                <p className="float-left">{reddit.upvotes} upvotes</p>
                                <p className="reddits-comments-icon float-left">{reddit.numberOfComments} Comments</p>
                                <p className="float-left">
                                    <span className="reply-time">{timeConverter(reddit.postedOn)[0]}</span>
                                    {timeConverter(reddit.postedOn)[1] && (
                                        <span className="full-date">{timeConverter(reddit.postedOn)[1]}</span>
                                    )}
                                </p>
                            </div>
                        </article>
                    ))}
                    {isLoading && <Loading />}
                    {isLoading && <Loading />}
                    {isLoading && <Loading />}
                    </Masonry>
            </ResponsiveMasonry>
            )}
            </div>
        </section>
    );
}

export default Reddits;