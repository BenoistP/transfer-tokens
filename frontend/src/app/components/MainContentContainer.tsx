// React
import { PropsWithChildren } from 'react'

// ------------------------------

const MainContentContainer = (props: PropsWithChildren ) => {

  return (
    <>
      <div className="bg-base-200 text-base-content rounded-box flex justify-center items-center">
        {props.children}
      </div>
    </>
  );
}

// ------------------------------

export default MainContentContainer;