// React

// ------------------------------

const ProgressBar = ({ showProgressBar=false, progressPercentage }: ITF_ProgressBar ) => {
  // console.debug(`ProgressBar.tsx render progressPercentage=${progressPercentage}`)

  return (
      <div className={'h-2 sm:h-4 md:h-6 '+(showProgressBar?"w-full":"invisible")}>
          <div style={{ width: `${progressPercentage}%`}}

            className={`h-full rounded-lg ease-in-out duration-1000 ${ 
              'bg-gradient-to-r from-base-100 to-base-content '
            }`}
/*           
              className={`h-full rounded-lg ease-in-out duration-1000 ${ 
                progressPercentage < 30 ? 'bg-gradient-to-r from-slate-50 to-red-600 ' :
                progressPercentage < 60 ? 'bg-gradient-to-r from-slate-50 to-orange-600 via-red-600 ' :
                progressPercentage < 90 ? 'bg-gradient-to-r from-slate-50 to-yellow-600 via-red-600' :
               'bg-gradient-to-r from-slate-50 to-yellow-300 via-red-600 '
              }`}
 */
            >
          </div>
      </div>
  );
};

// ------------------------------

export default ProgressBar;