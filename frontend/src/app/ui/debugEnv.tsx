
interface IDebugEnvProps {
  envName: string;
  keys: Iterable<any>
}

export default function DebugEnv( props: IDebugEnvProps ) {
  const { envName, keys } = props;

  return (
    keys &&
    <>
      <h1>DebugEnv</h1>
      <div>envName: {envName}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>keys: {JSON.stringify( keys)}</div>
    </>
  );
}
