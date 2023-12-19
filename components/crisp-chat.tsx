"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat=()=>{
    useEffect(()=>{
        Crisp.configure("63d005e1-e215-4c21-9454-1c59684278bb");
    },[]);

    return null;
}