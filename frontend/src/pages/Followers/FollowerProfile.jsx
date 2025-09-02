import { useParams } from 'react-router-dom';
import PostCard from '../../components/PostCard';
import Header from '../../components/Layout/Header';
import RightSidebar from '../../components/Layout/RightSidebar';
import mockFollowers from '../../data/mockFollowers';

const FollowerProfile = () => {
  const { id } = useParams();
  const follower = mockFollowers.find(f => f.id === id);

  if (!follower) {
    return <div className='p-6 text-center text-red-500 font-semibold'>Follower not found</div>;
  }
  
  return (
    <div className="px-15 py-20  ">
    <Header/>
      <h1 className="text-2xl font-bold">{follower.name}</h1>
      <p className="text-gray-600">{follower.role}</p>
      <img src={follower.avatar} alt={follower.name} className="w-45 h-45 rounded-full mt-5 mb-10" />
        <div className='max-w-3xl min-w-l mx-auto lg:mx-0 px-8 space-y-8'>
            <PostCard/>
        </div>
      <div className='hidden lg:block lg:w-80 fixed self-start top-0 right-0 h-full w-68 mt-10 px-4 z-0'>
      <RightSidebar/>
      </div>
    </div>
  );
};

export default FollowerProfile;