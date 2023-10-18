// React
import React from 'react'

// React router
import {
  Link
 } from "react-router-dom"


const CustomToastWithLink = ( {message, link} ) =>
{
  // console.debug(`CustomToastWithLink: _message=${message}, _link=${JSON.stringify(link)}`)
  const { uri, text, external=false, replace=false } = link
  return (
  <div>
    {message}
    {
     link && uri && text &&
      <div>
        { external
          ?
          <a href={uri} target={replace?"":"_blank"} rel="noreferrer noopener">{text}</a>
          :
          <Link to={uri} replace={replace}>{text}</Link>
        }
      </div>

    }
   {/* { <a href={_link} target="_blank" rel="noreferrer noopener">{_linkText}</a> } */}
    {/* {
     _link && _linkText &&
      <div>
        <Link to={{ pathname:_link}} target={(_externalLink?"_blank":"")} replace={_replace}>{_linkText}</Link>
      </div>
    } */}
  </div>
  ) // render
}
export default CustomToastWithLink;
