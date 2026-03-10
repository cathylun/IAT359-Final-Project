import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Button } from "react-native";


export default function CameraScreen({ navigation, addPhoto }) {

 const [facing, setFacing] = useState("back");
 const [permission, requestPermission] = useCameraPermissions();
 const [isCameraReady, setIsCameraReady] = useState(false);
 const [showSuccessText, setShowSuccessText] = useState(false);

 const cameraRef = useRef(null);

 if (!permission) return <View />;

 if (!permission.granted) {
   return (
     <View style={styles.screenContainer}>
       <Text style={{ textAlign:"center", marginBottom:20 }}>
         Camera permission required
       </Text>
       <Button title="Grant Permission" onPress={requestPermission}/>
     </View>
   );
 }

 const toggleCamera = () =>
   setFacing((current) => (current === "back" ? "front" : "back"));

 async function takePicture() {
   if (cameraRef.current && isCameraReady) {
     const photo = await cameraRef.current.takePictureAsync({
       base64:true,
       quality:0.5
     });

     const base64Image = `data:image/jpg;base64,${photo.base64}`;
     addPhoto(base64Image);

     setShowSuccessText(true);

     setTimeout(()=>{
       setShowSuccessText(false);
     },1000);
   }
 }

 return (
   <View style={{ flex:1, backgroundColor:"black" }}>

     <CameraView
       style={StyleSheet.absoluteFill}
       facing={facing}
       ref={cameraRef}
       onCameraReady={()=>setIsCameraReady(true)}
     />

     {showSuccessText && (
       <View style={styles.toastContainer}>
         <Text style={styles.toastText}>Photo Saved!</Text>
       </View>
     )}

     <View style={styles.cameraOverlay}>
       <TouchableOpacity
         style={styles.snapButton}
         onPress={takePicture}
       >
         <Text style={styles.camButtonText}>Snap</Text>
       </TouchableOpacity>

       <TouchableOpacity
         style={styles.flipButton}
         onPress={toggleCamera}
       >
         <Text style={styles.camButtonText}>Flip</Text>
       </TouchableOpacity>
     </View>
   </View>
 );
}

const styles = StyleSheet.create({
 screenContainer:{
   flex:1,
   justifyContent:"center",
   alignItems:"center"
 },

 toastContainer:{
   position:"absolute",
   top:120,
   width:"100%",
   alignItems:"center",
   zIndex:20
 },

 toastText:{
   backgroundColor:"green",
   color:"white",
   padding:10,
   borderRadius:20
 },

 cameraOverlay:{
   position:"absolute",
   bottom:40,
   width:"100%",
   flexDirection:"row",
   justifyContent:"space-around"
 },

 snapButton:{
   backgroundColor:"white",
   padding:20,
   borderRadius:40
 },

 flipButton:{
   backgroundColor:"gray",
   padding:15,
   borderRadius:20
 },

 camButtonText:{
   color:"black",
   fontWeight:"bold"
 }
});

