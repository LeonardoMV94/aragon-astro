import { humanize } from "@/lib/utils/textConverter";
import { marked } from "marked";
import { useState } from "react";
const JobPosts = ({ posts, categories, career }) => {
  const [tab, setTab] = useState("");
  const filterPost = !tab
    ? posts
    : posts.filter((post) => post.data.categories.includes(tab));

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-8">
            <h2>{career.title}</h2>
            <p
              className="mt-4"
              dangerouslySetInnerHTML={{
                __html: marked.parseInline(career.subtitle),
              }}
            />

            <ul className="filter-list mt-8 flex flex-wrap items-center justify-center">
              <li>
                <span
                  className={`filter-btn ${
                    !tab ? "filter-btn-active" : undefined
                  } btn btn-sm cursor-pointer`}
                  onClick={() => setTab("")}
                >
                  Todas las categorias
                </span>
              </li>
              {categories.map((category, i) => (
                <li key={`category-${i}`} onClick={() => setTab(category)}>
                  <span
                    className={`filter-btn ${
                      tab === category ? "filter-btn-active" : undefined
                    } btn btn-sm cursor-pointer`}
                  >
                    {humanize(category)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="row mt-12">
          {filterPost.map((post, i) => (
            <div className="mb-8 md:col-12" key={`post-${i}`}>
              <div className="rounded-xl bg-white p-5 shadow-lg lg:p-10">
                <h3 className="h4">{post.data.title}</h3>
                <p className="mt-6">{post.data.excerpt}</p>
                <ul className="mt-6 flex flex-wrap items-center text-text-dark">
                  <li className="my-1 mr-8 inline-flex items-center">
                    <svg
                      className="mr-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.65217 0C3.42496 0 0 3.58065 0 8C0 12.4194 3.42496 16 7.65217 16C11.8794 16 15.3043 12.4194 15.3043 8C15.3043 3.58065 11.8794 0 7.65217 0ZM7.65217 14.4516C4.24264 14.4516 1.48107 11.5645 1.48107 8C1.48107 4.43548 4.24264 1.54839 7.65217 1.54839C11.0617 1.54839 13.8233 4.43548 13.8233 8C13.8233 11.5645 11.0617 14.4516 7.65217 14.4516ZM9.55905 11.0839L6.93941 9.09355C6.84376 9.01935 6.78822 8.90323 6.78822 8.78065V3.48387C6.78822 3.27097 6.95484 3.09677 7.15849 3.09677H8.14586C8.34951 3.09677 8.51613 3.27097 8.51613 3.48387V8.05484L10.5773 9.62258C10.7439 9.74839 10.7778 9.99032 10.6575 10.1645L10.0774 11C9.95708 11.171 9.72567 11.2097 9.55905 11.0839Z"
                        fill="currentColor"
                      />
                    </svg>
                    {post.data.job_nature}
                  </li>
                  <li className="my-1 mr-8 inline-flex items-center">
                    <svg
                      className="mr-1"
                      width="16"
                      height="20"
                      viewBox="0 0 23 33"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.5007 0.970703C5.61504 0.970703 0.824219 5.75958 0.824219 11.6472C0.824219 20.1359 10.3612 31.2259 10.7669 31.6956L11.5007 32.5401L12.2345 31.6937C12.6402 31.2259 22.1772 20.1359 22.1772 11.6472C22.1772 5.75958 17.3863 0.970703 11.5007 0.970703ZM11.5007 29.5351C9.2761 26.7709 2.7654 18.1229 2.7654 11.6472C2.7654 6.83111 6.68463 2.91188 11.5007 2.91188C16.3167 2.91188 20.236 6.83111 20.236 11.6472C20.236 18.1171 13.7253 26.7709 11.5007 29.5351ZM11.5007 6.09347C8.28998 6.09347 5.67716 8.70629 5.67716 11.917C5.67716 15.1277 8.28998 17.7405 11.5007 17.7405C14.7114 17.7405 17.3242 15.1277 17.3242 11.917C17.3242 8.70629 14.7114 6.09347 11.5007 6.09347ZM11.5007 15.7993C9.35957 15.7993 7.61834 14.0581 7.61834 11.917C7.61834 9.77588 9.35957 8.03464 11.5007 8.03464C13.6418 8.03464 15.383 9.77588 15.383 11.917C15.383 14.0581 13.6418 15.7993 11.5007 15.7993Z"
                        fill="currentColor"
                      />
                    </svg>
                    {post.data.location}
                  </li>
                  {/* <li className="my-1 mr-8">
                    <a
                      className="inline-flex items-center font-semibold text-primary"
                      href={`/careers/${post.id}`}
                    >
                      Read More
                      <AiOutlineArrowRight className="ml-1.5 text-xl font-bold" />
                    </a>
                  </li> */}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobPosts;
