import type { NextPage } from 'next';
import Layout from '../components/Layout';
import { BoxLink } from '../components/utils/BoxLink';

const Home: NextPage = () => (
  <Layout meta={{ title: 'HOME' }}>
    <div className="flex relative z-20 items-center">
      <div className="container mx-auto px-6 flex flex-col justify-between items-center relative py-4">
        <div className="flex flex-col">
          <picture>
            <source
              srcSet={require('@public/images/icon.jpg?webp')}
              type="image/webp"
            />
            <source
              srcSet={require('@public/images/icon.jpg')}
              type="image/jpeg"
            />
            <img
              src={require('@public/images/icon.jpg')}
              className="rounded-full w-28 mx-auto"
              alt=""
              width="7rem"
              height="7rem"
            />
          </picture>
          <h2 className="text-3xl my-6 text-center dark:text-white">
            {"pro_shunsuke's page"}
          </h2>
          <div className="container flex flex-col mx-auto w-full items-center justify-center">
            <ul className="flex flex-col">
              <li className="border-gray-400 flex flex-row mb-2">
                <BoxLink href="/about-page" name="このページについて" />
              </li>
              <li className="border-gray-400 flex flex-row mb-2">
                <BoxLink href="/resume" name="職務経歴書" />
              </li>
              <li className="border-gray-400 flex flex-row mb-2">
                <BoxLink href="/posts" name="ブログ" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default Home;
