import { Bell, BriefcaseBusiness, Home, icons, MessageCircleMore, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
// type NAVitems={
//     src:string,
//     icon:JSX.Element,
//     text:string
// }

interface NAVitems{
    src:string,
    icon:JSX.Element,
    text:string
}
const navitems:NAVitems[] = [
    {
        src:'/home',
        icon: <Home />,
        text:"Home"
    },
    {
        src:'/networks',
        icon: <Users />,
        text:"My Network"
    },
    {
        src:'/job',
        icon: <BriefcaseBusiness />,
        text:"Jobs"
    },
    {
        src:'/message',
        icon: <MessageCircleMore />,
        text:"Messaging"
    },
    {
        src:'/notification',
        icon: <Bell />,
        text:"Notification"
    }
]

const Navitems = () => {
  return (
    <div className='flex gap-8'>
        {
            navitems.map((navitems, index)=>{
            return(<div key={index} className='flex flex-col items-center cursor-pointer text-[#666666] hover:text-black'>
                <span>{navitems.icon}</span>
                <Link className='text-xs' href={navitems.src}>{navitems.text}</Link>
            </div>)
            })
        }
      
    </div>
  )
}

export default Navitems
