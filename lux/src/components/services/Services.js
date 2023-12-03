import React from 'react'
import IndividualService from './IndividualService'

export const Services = ({services, addToCart}) => {

    // console.log(products);
    
    return services.map((individualService)=>(
        <IndividualService key = {individualService.ID} individualService={individualService} addToCart={addToCart}/>
    ))
}