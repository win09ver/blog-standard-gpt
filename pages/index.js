import Image from 'next/image';
import Link from 'next/link';
import HeroImage from '../public/hero.webp';
import Logo from '../components/Logo/Logo';

export default function Home() {
  return (
    <div
      className="
      w-screen 
      h-screen 
      overflow-hidden 
      flex 
      justify-center 
      items-center relative"
    >
      <Image src={HeroImage} alt="Hero" fill className="absolute" />
      <div
        className="
        relative z-10 
        text-white 
        px-10 
        text-center 
        py-5 
        max-w-screen-sm 
        bg-slate-900 
        rounded-md 
        backdrop-blur-sm"
      >
        <Logo />
        <p className="py-3">
          I'll build "BlogStandard" using a combination of Next.js, OpenAI's GPT, MongoDB, Auth0,
          Stripe, and Tailwind CSS. BlogStandard allows users to create an account (handled by
          auth0), purchase tokens (handled by stripe), and spend those tokens to generate blog
          posts, powered by OpenAI's GPT API. User's tokens and generated blog posts will be stored
          using MongoDB.
        </p>
        <Link href="/post/new" className="btn">
          Begin
        </Link>
      </div>
    </div>
  );
}
