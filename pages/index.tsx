import type {NextPage} from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';

const Home: NextPage = () => {
  return (
    <Layout meta={{title: 'HOME'}}>
      <div className="flex relative z-20 items-center">
        <div className="container mx-auto px-6 flex flex-col justify-between items-center relative py-4">
          <div className="flex flex-col">
            <img src="https://pbs.twimg.com/profile_images/1237275389/DSC_0062-2_400x400.jpg"
                 className="rounded-full w-28 mx-auto" alt=""/>
            <h2 className="text-3xl my-6 text-center dark:text-white">
              {"pro_shunsuke's page"}
            </h2>
            <div className="container flex flex-col mx-auto w-full items-center justify-center">
              <ul className="flex flex-col">
                <li className="border-gray-400 flex flex-row mb-2">
                  <Link href="/about-page">
                    <a className="w-full">
                      <div
                        className="shadow border select-none cursor-pointer bg-white dark:bg-gray-800 rounded-md flex flex-1 items-center p-4">
                        <div className="flex-1 pl-1 md:mr-16">
                          <div className="font-medium dark:text-white">
                            このページについて
                          </div>
                        </div>
                        <svg width="12" fill="currentColor" height="12"
                             className="hover:text-gray-800 dark:hover:text-white dark:text-gray-200 text-gray-500"
                             viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z">
                          </path>
                        </svg>
                      </div>
                    </a>
                  </Link>
                </li>
                <li className="border-gray-400 flex flex-row mb-2">
                  <Link href="/resume">
                    <a className="w-full">
                      <div
                        className="shadow border select-none cursor-pointer bg-white dark:bg-gray-800 rounded-md flex flex-1 items-center p-4">
                        <div className="flex-1 pl-1 md:mr-16">
                          <div className="font-medium dark:text-white">
                            職務経歴書
                          </div>
                        </div>
                        <svg width="12" fill="currentColor" height="12"
                             className="hover:text-gray-800 dark:hover:text-white dark:text-gray-200 text-gray-500"
                             viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z">
                          </path>
                        </svg>
                      </div>
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
