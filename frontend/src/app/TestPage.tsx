// React

// Components
// ...

// Translation
import { useTranslation } from 'react-i18next';

const TestPage = ( ) =>
{
  const { t } = useTranslation();


  return (
    <div className="text-accent bg-primary" >
      <h2 className='text-center text-base text-primary-content'>TestPage</h2>
      {t("test2.test2")}
    </div>
  )
} // App

export default TestPage;