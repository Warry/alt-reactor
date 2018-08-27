module View exposing (view)

import Html exposing (..)


view : String -> Html msg
view model =
    text ("Hello " ++ model)
