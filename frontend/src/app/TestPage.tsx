// React

// Components
// ...

// Translation
import { useTranslation } from 'react-i18next';

const TestPage = ( ) =>
{
  const { t } = useTranslation();


  return (
    <div className="" >
      <h2>TestPage</h2>
      {t("test2.test2")}
    </div>
  )
} // App

export default TestPage;