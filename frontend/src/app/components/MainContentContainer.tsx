// React
import { PropsWithChildren } from 'react'

export default function MainContentContainer(props: PropsWithChildren): JSX.Element {

  return (
    <>
      <div className="bg-base-200 text-base-content rounded-box flex justify-center items-center">
        {props.children}
      </div>
    </>
  );
}