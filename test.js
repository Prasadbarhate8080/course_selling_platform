// let array = [1,2,3,4,5]
// array.forEach(async () => {
//     await new Promise((resolve,reject) => {setTimeout(() => {return resolve("done")},4000)})
//     console.log("well")
// })



// const onSubmit:string = ():string => {
//     return ""
// }

// function onSubmit1():string{
//     return ""
// // }

// const {z} = require("z")

//  const videoSchema = z.object({
//     title:z.string()
//     .trim()
//     .min(4,"Title must be at least four letters")
//     .max(200,"title should not be greater than 200 letters"),
//     description:z.string()
//     .trim()
//     .min(20,"Description must be greater than 20 letters")
//     .max(1500,"description shoud not be greater than 1500 letters"),

// })

// let titleSchema = videoSchema.pick({title:true})
//     const titleResult = titleSchema.safeParse("this is the title")

// let test = () => {
//     for(let i = 0; i < 5; i++)
//     {
//         console.log(i)
//         if(i == 3) return i
//     }
// }
// console.log(test())