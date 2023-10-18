
// ------------------------------

const MainContentContainer = ( {children}: any ) => {

  // console.debug(`MainContentContainer.tsx render`)

  return (
    <>
      <div className="bg-base-200 text-base-content rounded-box flex justify-center items-center">

        {children}

      </div>
    </>
  );
}

// ------------------------------

export default MainContentContainer;