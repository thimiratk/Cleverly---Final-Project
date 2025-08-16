import React from 'react'
import notfound from '../../assets/notfound.png'

const NotFound = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className="max-w-4xl w-full flex items-center justify-center gap-12 flex-wrap lg:flex-nowrap">

            {/* Bear image */}
             {/* Reduce the image size==>shrink */}
            <div className='relative flex-shrink-0'>  
                <div className='relative z-10 flex items-center justify-center'>
                    <img src={notfound} alt='' width='400px' height='auto'/>
                </div>
            </div>

            {/* Text content */}
            <div className='text-center lg:text-left'>
                <h1 className='text-8xl font-black text-blue-800 mb-4 '>404</h1>
                <h2 className='text-2xl font-semibold text-orange-600 mb-4'>Something went wrong</h2>
                <p className='text-gray-600 mb-6 text-lg max-w-md'>We couldn't find the page you were looking for</p>
                    <button onClick={()=>window.location.href='/'} 
                    className='bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 px-10 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform'>
                        Go Home
                    </button>
            </div>
         </div>   
    </div>
  )
}

export default NotFound
